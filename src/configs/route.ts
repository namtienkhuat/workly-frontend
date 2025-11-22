export const paths = {
    home: '/',
    signin: '/signin',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    profile: '/user/profile',
    selectRole: '/select-role',
    testPost: '/test',
    // Example of a dynamic route
    postDetail: (id: string) => `/posts/${id}`,
};

export const apiPaths = {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    getPosts: '/api/posts',
    getProfilePost: "/posts/myPost",
    uploadFile: "/posts/uploads",
    getTest: "/posts/test",
    createPost: "/posts/create",
    deletePost: "/posts/delete",
    likePost: "/posts/like",
    unLikePost: "/posts/unlike",
    listLikePost: "/posts/like/list",
    getVideo: "/posts/video",
    createComment: "/posts/comment/create",
    getCommentById: "/posts/comment",
    getAllComment: "/posts/comment/list",
    getPostById: (id: string) => `/api/posts/${id}`,
};
