export const paths = {
    home: '/',
    signin: '/signin',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    profile: '/user/profile',
    postDetail: (id: string) => `/posts/${id}`,
};

export const apiPaths = {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    getPosts: '/api/posts',
    getPostById: (id: string) => `/api/posts/${id}`,
};
