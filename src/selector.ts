"use strict";

import { TextEditor, Range } from 'vscode';
import { EOL } from 'os';

export class Selector {
    public getSelectedText(editor: TextEditor, range: Range = null): string {
        if (!editor || !editor.document) {
            return null;
        }

        let selectedText: string;
        if (editor.selection.isEmpty) {
            let activeLine = !range ? editor.selection.active.line : range.start.line;
            selectedText = this.getDelimitedText(editor.document.getText(), activeLine);
        } else {
            selectedText = editor.document.getText(editor.selection);
        }

        return selectedText;
    }

    public static getDelimiterRows(lines: string[]) {
        let rows: number[] = [];
        for (var index = 0; index < lines.length; index++) {
            if (lines[index].match(/^#{3,}/)) {
                rows.push(index);
            }
        }
        return rows;
    }

    private getDelimitedText(fullText: string, currentLine: number): string {
        let lines: string[] = fullText.split(/\r?\n/g);
        let delimiterLineNumbers: number[] = Selector.getDelimiterRows(lines);
        if (delimiterLineNumbers.length === 0) {
            return fullText;
        }

        // return null if cursor is in delimiter line
        if (delimiterLineNumbers.indexOf(currentLine) > -1) {
            return null;
        }

        if (currentLine < delimiterLineNumbers[0]) {
            return lines.slice(0, delimiterLineNumbers[0]).join(EOL);
        }

        if (currentLine > delimiterLineNumbers[delimiterLineNumbers.length - 1]) {
            return lines.slice(delimiterLineNumbers[delimiterLineNumbers.length - 1] + 1).join(EOL);
        }

        for (var index = 0; index < delimiterLineNumbers.length - 1; index++) {
            let start = delimiterLineNumbers[index];
            let end = delimiterLineNumbers[index + 1];
            if (start < currentLine && currentLine < end) {
                return lines.slice(start + 1, end).join(EOL);
            }
        }
    }
}