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
        const dynamicTypographyStyles = `
            .${this.rootClassName} ${textSelectors},
            .${this.rootClassName} ${headingSelectors} {
                color: ${foreground};
            }

            .${this.rootClassName} :is(pre, code, blockquote, mark, kbd) {
                color: revert;
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
