# Kata PDF Display Fix

## Issue
Kata PDFs were not displaying in the PDF viewer component on the Kata Reference page.

## Root Cause
The PDFViewer component was trying to access PDFs from a hardcoded backend URL (`http://192.168.68.138:8083/katas/`) which was:
1. Using a specific IP address that doesn't match all environments
2. Attempting to access backend endpoints that required database setup
3. Not properly configured for the current development environment

## Solution Implemented

### 1. PDF File Relocation
- **Source**: `/Users/narenmudivarthy/Projects/KataMaster/backend/static/katas/`
- **Destination**: `/Users/narenmudivarthy/Projects/KataMaster/katamaster_ui/public/katas/`
- **Files**: All 30 Shotokan kata PDFs (01_Heian_Shodan.pdf through 30_Anan.pdf)

### 2. PDFViewer Component Update
**File**: `src/components/shared/PDFViewer.tsx`

**Before**:
```typescript
const pdfUrl = `http://192.168.68.138:8083/katas/${getPDFFileName(kataId)}`;
```

**After**:
```typescript
const pdfUrl = `/katas/${getPDFFileName(kataId)}`;
```

### 3. Static File Serving
PDFs are now served directly by the Vite development server from the `public/katas/` directory, making them accessible at URLs like:
- `http://localhost:5174/katas/01_Heian_Shodan.pdf`
- `http://localhost:5174/katas/11_Kanku_Dai.pdf`
- etc.

## Verification

### Testing Commands
```bash
# Test individual PDF access
curl -I "http://localhost:5174/katas/01_Heian_Shodan.pdf"
curl -I "http://localhost:5174/katas/11_Kanku_Dai.pdf"
curl -I "http://localhost:5174/katas/30_Anan.pdf"

# Verify PDF content type
curl -s "http://localhost:5174/katas/01_Heian_Shodan.pdf" | head -c 20 | file -
```

### Expected Results
- HTTP 200 OK responses
- Content-Type: application/pdf
- File type: PDF document, version 1.7

## Benefits

1. **Reliability**: No dependency on backend database or complex routing
2. **Performance**: Direct static file serving is faster than API calls
3. **Simplicity**: Eliminates backend configuration requirements
4. **Portability**: Works in any environment without IP address configuration
5. **Development Friendly**: Immediate availability during development

## Files Affected

1. **PDFViewer.tsx**: Updated PDF URL construction
2. **public/katas/**: New directory with all 30 kata PDFs
3. **Total File Size**: ~37MB of PDF content

## Kata PDF Mapping

The component maintains a complete mapping of all 30 Shotokan katas:

| Kata ID | PDF File | Status |
|---------|----------|--------|
| heian-shodan | 01_Heian_Shodan.pdf | ✅ Available |
| heian-nidan | 02_Heian_Nidan.pdf | ✅ Available |
| heian-sandan | 03_Heian_Sandan.pdf | ✅ Available |
| ... | ... | ... |
| anan | 30_Anan.pdf | ✅ Available |

## Usage

Users can now:
1. Navigate to the Kata Reference page
2. Click "📄 View Instructions PDF" on any kata card  
3. PDF will open in the modal viewer with zoom, download, and fullscreen controls
4. All 30 traditional Shotokan katas have PDF instructions available

## Future Considerations

1. **Production Deployment**: Ensure PDF files are included in production builds
2. **CDN Integration**: Consider serving PDFs from a CDN for better performance
3. **Backend Integration**: Once backend is fully operational, could optionally migrate back to API-based serving
4. **Caching**: Implement proper cache headers for PDF files in production