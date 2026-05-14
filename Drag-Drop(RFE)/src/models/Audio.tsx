import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class Audio extends UIElement {
    private audioUrl: string;

    constructor() {
        super();

        this.type = "audio";
        // this.audioUrl = "";
        this.audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

        this.styles = {
            width: "300px",
        };

        this.classes = "d-flex flex-column";
        this.html = this.getHtml();
    }

    public getAudioUrl = () => this.audioUrl;
    public setAudioUrl = (url: string) => (this.audioUrl = url);

    public getHtml = () => {
        return (
            <audio controls id={this.uniqueId} className={this.classes}>
                <source src={this.audioUrl} type="audio/mpeg" />
            </audio>

        );
    };

    public getStyledHtml = () => {
        return (
            <audio
                controls
                id={this.uniqueId}
                className={this.classes}
                style={{ ...this.styles }}
            >
                <source src={this.audioUrl} type="audio/mpeg" />
            </audio>
        );
    };

    public serialise(): string {
        return JSON.stringify({
            type: this.type,
            audioUrl: this.audioUrl,
            styles: JSON.stringify(this.styles),
            classes: this.classes,
            uniqueId: this.uniqueId,
            path: this.path,
        });
    }

    public static deserialise(str: string): UIElement {
        const obj = new Audio();
        const data = JSON.parse(str);

        obj.audioUrl = data.audioUrl;
        obj.setStyles(JSON.parse(data.styles));
        obj.setClasses(data.classes);
        obj.setType(data.type);
        obj.setPath(data.path);

        return obj;
    }

    public getEditables = (): Editables[] => {
        const a: SingleEditable = {
            type: EDITABLE_TYPE.SINGLE,
            property: "audioUrl",
            getMethod: this.getAudioUrl,
            setMethod: this.setAudioUrl,
        };
        return [a];
    };
}
