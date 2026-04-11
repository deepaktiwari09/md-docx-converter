--- Pandoc Lua filter: renders enterprise-styled tables in DOCX output.
--- Replaces Pandoc's basic table output with full OpenXML tables featuring:
---   - Cell borders (light gray)
---   - Header row (blue fill, white bold text)
---   - Alternating row shading (light gray)
---   - Proper cell padding
---   - Full page width

--- Escape special XML characters in text content.
local function escape_xml(text)
  text = text:gsub("&", "&amp;")
  text = text:gsub("<", "&lt;")
  text = text:gsub(">", "&gt;")
  text = text:gsub('"', "&quot;")
  return text
end

--- Convert Pandoc alignment to OpenXML justification value.
local function alignment_to_jc(align)
  if align == "AlignCenter" then return "center"
  elseif align == "AlignRight" then return "end"
  elseif align == "AlignLeft" then return "start"
  else return "start"
  end
end

--- Convert cell Blocks to OpenXML paragraphs via pandoc.write.
--- Falls back to stringify if pandoc.write fails.
local function blocks_to_openxml(blocks, align)
  if not blocks or #blocks == 0 then
    -- Empty cell still needs a paragraph
    return '<w:p/>'
  end

  -- Try pandoc.write for rich formatting
  local ok, result = pcall(function()
    return pandoc.write(pandoc.Pandoc(blocks), "openxml")
  end)

  if ok and result and #result > 0 then
    return result
  end

  -- Fallback: plain text
  local text = pandoc.utils.stringify(pandoc.Pandoc(blocks))
  local jc = alignment_to_jc(align)
  return string.format(
    '<w:p><w:pPr><w:jc w:val="%s"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">%s</w:t></w:r></w:p>',
    jc, escape_xml(text)
  )
end

--- Build a header cell with blue background and white bold text.
local function header_cell_xml(text, align, width)
  local jc = alignment_to_jc(align)
  return string.format([[
<w:tc>
  <w:tcPr>
    <w:tcW w:w="%d" w:type="dxa"/>
    <w:shd w:val="clear" w:color="auto" w:fill="4472C4"/>
    <w:vAlign w:val="center"/>
  </w:tcPr>
  <w:p>
    <w:pPr>
      <w:jc w:val="%s"/>
      <w:spacing w:before="0" w:after="0"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:b/>
        <w:bCs/>
        <w:color w:val="FFFFFF"/>
        <w:sz w:val="20"/>
        <w:szCs w:val="20"/>
      </w:rPr>
      <w:t xml:space="preserve">%s</w:t>
    </w:r>
  </w:p>
</w:tc>]], width, jc, escape_xml(text))
end

--- Build a body cell with optional shading.
local function body_cell_xml(blocks, align, shaded, width)
  local cell_content = blocks_to_openxml(blocks, align)
  local shd = ""
  if shaded then
    shd = '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>'
  end

  return string.format([[
<w:tc>
  <w:tcPr>
    <w:tcW w:w="%d" w:type="dxa"/>
    %s
    <w:vAlign w:val="center"/>
  </w:tcPr>
  %s
</w:tc>]], width, shd, cell_content)
end

--- Compute content-aware column widths.
--- Classifies columns as "compact" (short content → exact-fit) or
--- "flexible" (long content → shares remaining space via sqrt distribution).
--- With fixed layout + pct table width, values act as proportional weights.
local function compute_col_widths(tbl)
  local num_cols = #tbl.colspecs
  local page_width = 9360       -- 6.5 inches in twips
  local twips_per_char = 120    -- approx width per char in 10pt Calibri
  local cell_padding = 300      -- left+right cell margins in twips
  local compact_threshold = 15  -- columns with max content ≤ this get exact-fit

  -- Track max text length and longest word per column
  local max_lengths = {}
  local max_word_lengths = {}
  for i = 1, num_cols do
    max_lengths[i] = 1
    max_word_lengths[i] = 1
  end

  local function longest_word(text)
    local max_len = 0
    for word in text:gmatch("%S+") do
      if #word > max_len then max_len = #word end
    end
    return max_len
  end

  local function scan_row(row)
    for i, cell in ipairs(row.cells) do
      if i <= num_cols then
        local text = pandoc.utils.stringify(pandoc.Pandoc(cell.contents))
        if #text > max_lengths[i] then
          max_lengths[i] = #text
        end
        local wl = longest_word(text)
        if wl > max_word_lengths[i] then
          max_word_lengths[i] = wl
        end
      end
    end
  end

  -- Scan all rows
  if tbl.head and tbl.head.rows then
    for _, row in ipairs(tbl.head.rows) do scan_row(row) end
  end
  if tbl.bodies then
    for _, body in ipairs(tbl.bodies) do
      if body.body then
        for _, row in ipairs(body.body) do scan_row(row) end
      end
    end
  end

  -- Classify: compact columns get exact-fit, flexible columns share the rest
  local widths = {}
  local compact_total = 0
  local flex_indices = {}

  for i = 1, num_cols do
    if max_lengths[i] <= compact_threshold then
      -- Exact-fit: just enough for the content + padding
      widths[i] = max_lengths[i] * twips_per_char + cell_padding
      compact_total = compact_total + widths[i]
    else
      -- Mark as flexible, assign later
      widths[i] = nil
      flex_indices[#flex_indices + 1] = i
    end
  end

  -- Distribute remaining space among flexible columns
  if #flex_indices > 0 then
    local flex_space = math.max(page_width - compact_total, #flex_indices * 1440)
    local flex_sqrt_total = 0
    for _, i in ipairs(flex_indices) do
      flex_sqrt_total = flex_sqrt_total + math.sqrt(max_lengths[i])
    end

    for _, i in ipairs(flex_indices) do
      local share = math.floor((math.sqrt(max_lengths[i]) / flex_sqrt_total) * flex_space)
      -- Ensure column fits its longest unbreakable word
      local word_min = max_word_lengths[i] * twips_per_char + cell_padding
      widths[i] = math.max(share, word_min)
    end
  end

  -- Safety: if all columns are compact and total < page_width,
  -- the pct-based table width auto-scales them up proportionally.
  -- If total exceeds page_width, scale everything down proportionally.
  local total = 0
  for i = 1, num_cols do total = total + widths[i] end
  if total > page_width then
    local scale = page_width / total
    for i = 1, num_cols do
      widths[i] = math.floor(widths[i] * scale)
    end
  end

  return widths
end

--- Main filter: convert Table elements to styled OpenXML tables.
function Table(tbl)
  local xml = {}

  local num_cols = #tbl.colspecs

  -- Collect alignment info
  local aligns = {}
  for i, colspec in ipairs(tbl.colspecs) do
    aligns[i] = tostring(colspec[1])
  end

  -- Compute content-aware column widths
  local col_widths = compute_col_widths(tbl)

  -- Table start + properties
  table.insert(xml, '<w:tbl>')
  table.insert(xml, '<w:tblPr>')
  table.insert(xml, '  <w:tblW w:w="5000" w:type="pct"/>')
  table.insert(xml, '  <w:tblLayout w:type="fixed"/>')
  table.insert(xml, '  <w:tblBorders>')
  table.insert(xml, '    <w:top w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>')
  table.insert(xml, '    <w:left w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>')
  table.insert(xml, '    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>')
  table.insert(xml, '    <w:right w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>')
  table.insert(xml, '    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>')
  table.insert(xml, '    <w:insideV w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>')
  table.insert(xml, '  </w:tblBorders>')
  table.insert(xml, '  <w:tblCellMar>')
  table.insert(xml, '    <w:top w:w="55" w:type="dxa"/>')
  table.insert(xml, '    <w:start w:w="100" w:type="dxa"/>')
  table.insert(xml, '    <w:bottom w:w="55" w:type="dxa"/>')
  table.insert(xml, '    <w:end w:w="100" w:type="dxa"/>')
  table.insert(xml, '  </w:tblCellMar>')
  table.insert(xml, '  <w:tblLook w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>')
  table.insert(xml, '</w:tblPr>')

  -- Column grid with content-aware widths
  table.insert(xml, '<w:tblGrid>')
  for i = 1, num_cols do
    table.insert(xml, string.format('  <w:gridCol w:w="%d"/>', col_widths[i]))
  end
  table.insert(xml, '</w:tblGrid>')

  -- Header rows
  if tbl.head and tbl.head.rows then
    for _, row in ipairs(tbl.head.rows) do
      table.insert(xml, '<w:tr>')
      table.insert(xml, '  <w:trPr><w:tblHeader/></w:trPr>')
      for i, cell in ipairs(row.cells) do
        local text = pandoc.utils.stringify(pandoc.Pandoc(cell.contents))
        local align = aligns[i] or "AlignDefault"
        table.insert(xml, header_cell_xml(text, align, col_widths[i]))
      end
      table.insert(xml, '</w:tr>')
    end
  end

  -- Body rows with alternating shading
  local row_index = 0
  if tbl.bodies then
    for _, body in ipairs(tbl.bodies) do
      if body.body then
        for _, row in ipairs(body.body) do
          local shaded = (row_index % 2 == 1)
          table.insert(xml, '<w:tr>')
          for i, cell in ipairs(row.cells) do
            local align = aligns[i] or "AlignDefault"
            table.insert(xml, body_cell_xml(cell.contents, align, shaded, col_widths[i]))
          end
          table.insert(xml, '</w:tr>')
          row_index = row_index + 1
        end
      end
    end
  end

  table.insert(xml, '</w:tbl>')

  return pandoc.RawBlock("openxml", table.concat(xml, "\n"))
end
