class Avatar {
    #AVATAR_API = "https://avatars.dicebear.com/api/bottts";

    constructor() {
        this.accentColor = null;
        this.imageURI = null;
    }

    async make(seed) {
        const avatar = new Avatar();
        const uri = `${seed}.svg`;
        avatar.imageURI = uri;
    }
}

export default Avatar;
