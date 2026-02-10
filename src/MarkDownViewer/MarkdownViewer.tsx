import * as React from 'react';

const ReactMarkdown = require('react-markdown')
import MarkdownPreview from '@uiw/react-markdown-preview';

export interface IMarkdownViewerProps {
    content?:   string | undefined
    fontSize?:  number | undefined
    fontFamily?: string | undefined
    fill?:      string | undefined
    overflow?:  string | undefined
    maxHeight?: string | undefined
    maxWidth?:  string | undefined
}

type MarkdownPalette = {
    codeBlockBackground: string;
    codeBlockText: string;
    codeBorder: string;
    codeShadow: string;
    inlineCodeBackground: string;
    inlineCodeText: string;
    tableBackground: string;
    tableBorder: string;
    tableHeaderBackground: string;
    tableHeaderText: string;
    tableRowEvenBackground: string;
};

export default class MarkdownViewer extends React.Component<IMarkdownViewerProps> {
    content?: string | undefined
    private readonly rootClassName = "md-viewer-root";
    private readonly defaultFill = "#ffffff";
    private readonly darkText = "#0f172a";
    private readonly lightText = "#f8fafc";

    public render() {
        const headingSelectors = "h1, h2, h3, h4, h5, h6";
        const textSelectors = "p, ul, ol, li, span, strong, em, table, th, td, dl, dt, dd, a, a:visited, a:active";
        const foreground = this.getAccessibleTextColor();
        const palette = this.getMarkdownPalette();
        const dynamicTypographyStyles = `
            .${this.rootClassName} ${textSelectors},
            .${this.rootClassName} ${headingSelectors} {
                color: ${foreground};
            }

            .${this.rootClassName} pre {
                background: ${palette.codeBlockBackground};
                color: ${palette.codeBlockText};
                font-family: 'Cascadia Code', 'Fira Code', 'Consolas', 'SFMono-Regular', 'Menlo', monospace;
                padding: 12px 16px;
                border-radius: 8px;
                border: 1px solid ${palette.codeBorder};
                overflow-x: auto;
                box-shadow: 0 4px 18px ${palette.codeShadow};
                margin: 16px 0;
            }

            .${this.rootClassName} pre code {
                color: inherit;
                background: transparent;
                padding: 0;
            }

            .${this.rootClassName} code:not(pre code) {
                background: ${palette.inlineCodeBackground};
                color: ${palette.inlineCodeText};
                border-radius: 4px;
                padding: 2px 6px;
                border: 1px solid ${palette.codeBorder};
                font-family: 'Cascadia Code', 'Fira Code', 'Consolas', 'SFMono-Regular', 'Menlo', monospace;
            }

            .${this.rootClassName} table {
                width: 100%;
                border-collapse: collapse;
                background: ${palette.tableBackground};
                border: 1px solid ${palette.tableBorder};
                margin: 16px 0;
                border-radius: 6px;
                overflow: hidden;
            }

            .${this.rootClassName} th {
                background: ${palette.tableHeaderBackground};
                color: ${palette.tableHeaderText};
                border: 1px solid ${palette.tableBorder};
                padding: 10px 12px;
                text-align: left;
                font-weight: 600;
            }

            .${this.rootClassName} td {
                border: 1px solid ${palette.tableBorder};
                padding: 10px 12px;
            }

            .${this.rootClassName} tr:nth-child(even) td {
                background: ${palette.tableRowEvenBackground};
            }
        `;

        return (
            <div className={this.rootClassName} style={{
                overflow:  this.props.overflow  || "auto",
                textAlign: "left",
                fontSize:  this.props.fontSize ? `${this.props.fontSize}px` : "16px",
                fontFamily: this.props.fontFamily || "inherit",
                color: foreground,
                backgroundColor: this.props.fill || "transparent",
                height:    this.props.maxHeight || "initial",
                width:     this.props.maxWidth  || "initial",
                maxHeight: this.props.maxHeight || "none",
                maxWidth:  this.props.maxWidth  || "none",
                userSelect: "text"
                }}>
                <style>{dynamicTypographyStyles}</style>
                <div id="mdViewer" style={{ fontFamily: this.props.fontFamily || "inherit", fontSize: this.props.fontSize ? `${this.props.fontSize}px` : "16px" }}>
                    <div className="wmde-markdown-var"> </div>
                    <MarkdownPreview
                        id="mdMarkDown"
                        source={this.props.content || ''}
                        style={{
                            background: "transparent",
                            fontFamily: this.props.fontFamily || "inherit",
                            fontSize: this.props.fontSize ? `${this.props.fontSize}px` : "16px"
                        }}
                        rehypeRewrite={(node: any, index: any, parent: any) => {
                            if (node.tagName === "a" && parent && /^h(1|2|3|4|5|6)/.test(parent.tagName)) {
                                parent.children = parent.children.slice(1)
                            }
                        }}
                    />
                </div>
            </div>            
        );
    }

    private getAccessibleTextColor(): string {
        const luminance = this.getRelativeLuminance(this.props.fill);
        if (luminance === undefined) {
            return this.darkText;
        }

        return luminance > 0.55 ? this.darkText : this.lightText;
    }

    private getMarkdownPalette(): MarkdownPalette {
        const luminance = this.getRelativeLuminance(this.props.fill);
        const isLightSurface = luminance === undefined ? true : luminance > 0.55;

        if (isLightSurface) {
            return {
                codeBlockBackground: "#0f172a",
                codeBlockText: "#f8fafc",
                codeBorder: "#1e293b",
                codeShadow: "rgba(15,23,42,0.35)",
                inlineCodeBackground: "#e2e8f0",
                inlineCodeText: "#0f172a",
                tableBackground: "#ffffff",
                tableBorder: "#cbd5e1",
                tableHeaderBackground: "#e2e8f0",
                tableHeaderText: "#0f172a",
                tableRowEvenBackground: "#f8fafc"
            };
        }

        return {
            codeBlockBackground: "#111827",
            codeBlockText: "#f4f8ff",
            codeBorder: "#273449",
            codeShadow: "rgba(0,0,0,0.55)",
            inlineCodeBackground: "#1f2a3d",
            inlineCodeText: "#fef9c3",
            tableBackground: "#0f172a",
            tableBorder: "#24324a",
            tableHeaderBackground: "#1e293b",
            tableHeaderText: "#f1f5f9",
            tableRowEvenBackground: "#14233c"
        };
    }

    private getRelativeLuminance(color?: string): number | undefined {
        const fallbackRgb = this.hexToRgb(this.defaultFill);
        const rgb = this.hexToRgb(color) || fallbackRgb;
        if (!rgb) {
            return undefined;
        }

        const normalize = (value: number) => {
            const srgb = value / 255;
            return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
        };

        const r = normalize(rgb.r);
        const g = normalize(rgb.g);
        const b = normalize(rgb.b);

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    private hexToRgb(value?: string): { r: number; g: number; b: number } | undefined {
        if (!value) {
            return undefined;
        }

        const trimmed = value.trim();
        const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed);
        if (!match) {
            return undefined;
        }

        let hex = match[1];
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        const intVal = parseInt(hex, 16);
        return {
            r: (intVal >> 16) & 255,
            g: (intVal >> 8) & 255,
            b: intVal & 255
        };
    }
}
