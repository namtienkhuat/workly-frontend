// For client-side routes (page navigation)
export const paths = {
    home: '/',
    signin: '/signin',
    signup: '/signup',
    profile: '/user/profile',
    testPost: '/test',
    // Example of a dynamic route
    postDetail: (id: string) => `/posts/${id}`,
};

// For Backend API endpoints
export const apiPaths = {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    getPosts: '/api/posts',
    getProfilePost: "/posts/myPost",
    uploadFile: "/posts/uploads",
    getTest: "/posts/test",
    createPost: "/posts/create",
    getVideo: "/posts/video",
    getPostById: (id: string) => `/api/posts/${id}`,
};
