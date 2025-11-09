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
    getProfilePost: "/myPost",
    getPostById: (id: string) => `/api/posts/${id}`,
};
