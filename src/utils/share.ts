import LZString from 'lz-string';
import { AppState } from '../store/useMatchStore';

export const generateShareLink = (state: AppState): string => {
    // 1. Minify/Serialize
    const json = JSON.stringify(state);
    
    // 2. Compact & Encode (LZ-String handles URL safety)
    const compressed = LZString.compressToEncodedURIComponent(json);
    
    // 3. Generate Link
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    return `${url}/#state=${compressed}`;
};

export const parseStateFromLink = (hash: string): AppState | null => {
    try {
        if (!hash.includes('state=')) return null;
        
        const compressed = hash.split('state=')[1];
        if (!compressed) return null;

        // 1. Decode & Decompress
        const json = LZString.decompressFromEncodedURIComponent(compressed);
        
        // 2. Parse
        if (!json) return null;
        return JSON.parse(json) as AppState;
    } catch (error) {
        console.error("Failed to parse state from link", error);
        return null;
    }
};
