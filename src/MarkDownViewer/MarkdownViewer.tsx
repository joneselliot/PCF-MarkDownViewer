import * as React from 'react';

const ReactMarkdown = require('react-markdown')
import MarkdownPreview from '@uiw/react-markdown-preview';

export interface IMarkdownViewerProps {
    content?:   string | undefined
    fontSize?:  number | undefined
    fontFamily?: string | undefined
    overflow?:  string | undefined
    maxHeight?: string | undefined
    maxWidth?:  string | undefined
}

export default class MarkdownViewer extends React.Component<IMarkdownViewerProps> {
    content?: string | undefined

    public render() {

        return (
            <div style={{
                overflow:  this.props.overflow  || "auto",
                textAlign: "left",
                fontSize:  this.props.fontSize ? `${this.props.fontSize}px` : "16px",
                fontFamily: this.props.fontFamily || "inherit",
                height:    this.props.maxHeight || "initial",
                width:     this.props.maxWidth  || "initial",
                maxHeight: this.props.maxHeight || "none",
                maxWidth:  this.props.maxWidth  || "none",
                userSelect: "text"
                }}>
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
}
