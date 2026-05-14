import UIElement, { EDITABLE_TYPE, Editables, SingleEditable } from "./UIElement";

export default class VideoElement extends UIElement {
    private videoUrl: string;
    private aspectRatio: string = "auto";

    constructor() {
        super();

        this.type = "video";
        this.videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

        this.styles = {
            width: "300px",
            height: "auto",
            objectFit: "cover",
        };

        this.classes = "d-flex flex-column";
        this.html = this.getHtml();
    }

    /** URL getters/setters */
    public getVideoUrl = () => this.videoUrl;
    public setVideoUrl = (url: string) => (this.videoUrl = url);
    public setAspectRatio = (ratio: string) => (this.aspectRatio = ratio);

    /** Detect and convert URLs */
    private processVideoUrl(url: string): { type: "video" | "youtube" | "drive", src: string } {
        if (!url) return { type: "video", src: "" };

        // 🎥 YouTube Detection
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            let videoId = "";

            if (url.includes("watch?v=")) {
                videoId = url.split("v=")[1].split("&")[0];
            } else if (url.includes("youtu.be")) {
                videoId = url.split("youtu.be/")[1].split("?")[0];
            }

            return {
                type: "youtube",
                src: `https://www.youtube.com/embed/${videoId}`,
            };
        }

        // 📦 Google Drive Detection
        if (url.includes("drive.google.com")) {
            let fileId = "";

            if (url.includes("/file/d/")) {
                fileId = url.split("/file/d/")[1].split("/")[0];
            }

            return {
                type: "drive",
                src: `https://drive.google.com/file/d/${fileId}/preview`,
            };
        }

        // ⬇ Direct .mp4 or unknown → Use video tag
        return { type: "video", src: url };
    }

    /** Base HTML (unstyled) */
    public getHtml = () => {
        const { type, src } = this.processVideoUrl(this.videoUrl);

        if (type === "youtube" || type === "drive") {
            return (
                <iframe id={this.uniqueId} src={src} allow="autoplay" />
            );
        }

        return (
            <video id={this.uniqueId} controls>
                <source src={src} />
            </video>
        );
    };

    /** Styled HTML */
    public getStyledHtml = () => {
        const { type, src } = this.processVideoUrl(this.videoUrl);
        const hasAspect = !!this.styles.aspectRatio;
        // const styleObj = {
        //     ...this.styles,
        //     aspectRatio: this.aspectRatio === "auto" ? undefined : this.aspectRatio,
        // };

        if (type === "youtube" || type === "drive") {
            return (
                <iframe
                    id={this.uniqueId}
                    className={this.classes}
                    // style={styleObj}
                    src={src}
                    allow="autoplay"
                    style={{
                        ...this.styles,

                        // If aspect ratio is present → height must be auto
                        // If auto → use fixed height so object-fit can work
                        height: hasAspect ? "auto" : "200px",
                    }}
                />
            );
        }

        return (
            <video
                id={this.uniqueId}
                className={this.classes}
                controls
                style={{
                    ...this.styles,

                    // If aspect ratio is present → height must be auto
                    // If auto → use fixed height so object-fit can work
                    height: hasAspect ? "auto" : "200px",
                }}
            >
                <source src={src} />
            </video>
        );
    };

    /** Serialization */
    public serialise(): string {
        let parentJSON = {
            styles: JSON.stringify(this.styles),
            classes: this.classes,
            type: this.type,
            path: this.path,
            uniqueId: this.uniqueId,
        };

        let retJSON = {
            ...parentJSON,
            videoUrl: this.videoUrl,
            aspectRatio: this.aspectRatio,
        };

        return JSON.stringify(retJSON);
    }

    /** Load saved video */
    public static deserialise(str: string): UIElement {
        const dataJSON = JSON.parse(str);
        const obj = new VideoElement();

       obj.setVideoUrl(dataJSON.videoUrl);
       obj.setAspectRatio(dataJSON.aspectRatio);
       obj.setStyles(JSON.parse(dataJSON.styles));
       obj.setClasses(dataJSON.classes);
       obj.setType(dataJSON.type);
       obj.setPath(dataJSON.path);

    return obj;
    }

    /** Edit panel options */
    public getEditables = (): Editables[] => {
        const a: SingleEditable = {
            type: EDITABLE_TYPE.SINGLE,
            property: "videoUrl",
            getMethod: this.getVideoUrl,
            setMethod: this.setVideoUrl,
        };
        return [a];
    };
}
