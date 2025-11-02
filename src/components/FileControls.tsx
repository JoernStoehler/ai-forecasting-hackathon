import React, { useRef } from 'react';
import { Icon } from './icons';
import { Event } from '../types';

interface FileControlsProps {
    events: Event[];
    onImport: (newEvents: Event[], mode: 'replace' | 'merge') => void;
}

export const FileControls: React.FC<FileControlsProps> = ({ events, onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = JSON.stringify(events, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `takeoff-timeline-${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not readable");
                const parsedEvents = JSON.parse(text);
                // Simple validation
                if (Array.isArray(parsedEvents) && parsedEvents.every(item => 'date' in item && 'title' in item)) {
                    // For simplicity, we always replace. A more complex app could offer a merge option.
                    if (window.confirm("Replace current timeline with the imported one?")) {
                       onImport(parsedEvents, 'replace');
                    }
                } else {
                    throw new Error("Invalid event file format.");
                }
            } catch (error) {
                alert(`Error importing file: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        };
        reader.readAsText(file);
        // Reset file input to allow importing the same file again
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex items-center space-x-2 ml-4">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
            />
            <button onClick={handleImportClick} className="p-2 text-stone-600 hover:bg-beige-200 rounded-full transition" title="Import JSON">
                <Icon name="Upload" className="w-6 h-6" />
            </button>
            <button onClick={handleExport} className="p-2 text-stone-600 hover:bg-beige-200 rounded-full transition" title="Export JSON">
                <Icon name="Download" className="w-6 h-6" />
            </button>
        </div>
    );
};
