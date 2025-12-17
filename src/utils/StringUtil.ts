const BACKEND_URL = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || 'http://localhost:8000';
export const STORAGE_URL = `${BACKEND_URL}/storage`;

export default {
    generatePath(path: string): string {
        // console.log(STORAGE_URL + "/uploads/images/" + path);

        return STORAGE_URL + '/uploads/images/' + path;
    },
    generatePathVideo(path: string): string {
        return BACKEND_URL + '/api/v1/posts/video/' + path;
    },

    getRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },
};
