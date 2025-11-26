import { BACKEND_URL } from "./models/Constants"

export const STORAGE_URL = 'http://localhost:8000/storage';

export default {
    generatePath(path: string): string {
        console.log(STORAGE_URL + "/uploads/images/" + path);

        return STORAGE_URL + "/uploads/images/" + path
    },
    generatePathVideo(path: string): string {
        return BACKEND_URL + "/posts/video/" + path
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