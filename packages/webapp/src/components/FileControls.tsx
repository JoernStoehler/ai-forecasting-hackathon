import React, { useRef } from 'react';
import { Icon } from './icons';
import { EngineEvent } from '../types';
import { coerceEngineEvents } from '../utils/events';
import { dateFromISO } from '@/engine/utils/strings';

interface FileControlsProps {
    events: EngineEvent[];
    onImport: (newEvents: EngineEvent[]) => void;
}

export const FileControls: React.FC<FileControlsProps> = ({ events, onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = JSON.stringify(events, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `takeoff-timeline-${dateFromISO(new Date().toISOString())}.json`;
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
                const validatedEvents = coerceEngineEvents(parsedEvents, file.name || 'imported file');
                if (window.confirm("Replace current timeline with the imported one?")) {
                   onImport(validatedEvents);
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
                aria-label="Import timeline file"
            />
            <button
                onClick={handleImportClick}
                className="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 hover:bg-beige-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                title="Import JSON"
                aria-label="Import timeline from JSON file"
            >
                <Icon name="Upload" className="w-5 h-5" />
            </button>
            <button
                onClick={handleExport}
                className="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 hover:bg-beige-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                title="Export JSON"
                aria-label="Export timeline as JSON file"
            >
                <Icon name="Download" className="w-5 h-5" />
            </button>
        </div>
    );
};
