--- Pandoc Lua filter: renders mermaid code blocks as PNG images in DOCX output.
--- Uses PNG at 2x scale for crisp rendering (SVG text breaks in Word's EMF conversion).
--- Requires mmdc (mermaid-cli) on PATH. Graceful fallback if unavailable.

local system = require("pandoc.system")

-- Resolve directory containing this filter (for sibling config files)
local filter_dir = PANDOC_SCRIPT_FILE:match("(.*[/\\])")

-- Check mmdc availability once on filter load
local function check_mmdc()
  local handle = io.popen("mmdc --version 2>&1")
  if handle then
    local result = handle:read("*a")
    handle:close()
    if result and result:match("%d+%.%d+") then
      return true
    end
  end
  return false
end

local HAS_MMDC = check_mmdc()

--- Determine optimal image width based on mermaid diagram type.
--- Inspects the mermaid source text to guess the layout direction.
--- @param mmd_source string The mermaid diagram source code
--- @return string Width value for pandoc Image attribute
local function compute_width(mmd_source)
  -- Detect horizontal flowcharts
  if mmd_source:match("flowchart%s+LR") or mmd_source:match("graph%s+LR")
     or mmd_source:match("flowchart%s+RL") or mmd_source:match("graph%s+RL") then
    return "6.5in"   -- horizontal → full page width
  end

  -- Detect vertical flowcharts / tall diagrams
  if mmd_source:match("flowchart%s+TD") or mmd_source:match("flowchart%s+TB")
     or mmd_source:match("graph%s+TD") or mmd_source:match("graph%s+TB") then
    return "5in"
  end

  -- Sequence diagrams tend to be wide
  if mmd_source:match("^%s*sequenceDiagram") then
    return "6.5in"
  end

  -- Gantt charts are wide
  if mmd_source:match("^%s*gantt") then
    return "6.5in"
  end

  -- ER diagrams, class diagrams, pie, state — moderate width
  if mmd_source:match("^%s*erDiagram") or mmd_source:match("^%s*classDiagram") then
    return "5.5in"
  end

  -- Default
  return "5.5in"
end

--- Main filter: convert mermaid code blocks to PNG images.
function CodeBlock(block)
  if not block.classes:includes("mermaid") then
    return nil  -- not a mermaid block, pass through
  end

  if not HAS_MMDC then
    return nil  -- mmdc not available, keep as code block
  end

  -- Resolve config file paths
  local mermaid_config = filter_dir .. "mermaid-config.json"
  local puppeteer_config = filter_dir .. "puppeteer-config.json"

  -- Use pandoc's temp directory (auto-cleaned on scope exit)
  local success, result = pcall(function()
    return system.with_temporary_directory("mermaid", function(tmpdir)
      local sep = package.config:sub(1, 1)  -- OS path separator
      local input_file = tmpdir .. sep .. "diagram.mmd"
      local output_file = tmpdir .. sep .. "diagram.png"

      -- Write mermaid source to temp file
      local f = io.open(input_file, "w")
      if not f then return nil end
      f:write(block.text)
      f:close()

      -- Build mmdc command — PNG output at 2x scale for crisp text
      local cmd_parts = {
        'mmdc',
        '-i', '"' .. input_file .. '"',
        '-o', '"' .. output_file .. '"',
        '-b', 'white',
        '-s', '2',
      }

      -- Add config files if they exist
      local cfg = io.open(mermaid_config, "r")
      if cfg then
        cfg:close()
        table.insert(cmd_parts, '-c')
        table.insert(cmd_parts, '"' .. mermaid_config .. '"')
      end

      local pup = io.open(puppeteer_config, "r")
      if pup then
        pup:close()
        table.insert(cmd_parts, '-p')
        table.insert(cmd_parts, '"' .. puppeteer_config .. '"')
      end

      local cmd = table.concat(cmd_parts, " ")
      local exit_ok = os.execute(cmd .. " 2>/dev/null")

      -- os.execute returns different types across Lua versions
      if exit_ok == nil or exit_ok == false or (type(exit_ok) == "number" and exit_ok ~= 0) then
        return nil  -- render failed, keep original code block
      end

      -- Verify PNG was created
      local png_file = io.open(output_file, "rb")
      if not png_file then return nil end
      local png_size = png_file:seek("end")
      png_file:close()

      if not png_size or png_size == 0 then
        return nil
      end

      -- Copy PNG to a stable location (pandoc needs file to exist after filter)
      local stable_png = os.tmpname() .. ".png"
      local src = io.open(output_file, "rb")
      local dst = io.open(stable_png, "wb")
      if not src or not dst then return nil end
      dst:write(src:read("*a"))
      src:close()
      dst:close()

      -- Compute width from diagram type
      local width = compute_width(block.text)

      local caption = block.attributes["caption"] or ""
      local img = pandoc.Image(caption, stable_png, "", pandoc.Attr("", {}, {{"width", width}}))
      return pandoc.Para({img})
    end)
  end)

  if success and result then
    return result
  end

  -- On any error, keep original code block (graceful fallback)
  return nil
end
