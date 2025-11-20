import { BACKEND_URL } from "./models/Constants"

export default {
    generatePath(path: string): string {
        return BACKEND_URL + "/posts/uploads/images/" + path
    },

    getRandomColor(): string {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}