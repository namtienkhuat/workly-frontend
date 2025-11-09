// For client-side routes (page navigation)
export const paths = {
    home: '/',
    signin: '/signin',
    signup: '/signup',
    profile: '/user/profile',
    // Example of a dynamic route
    postDetail: (id: string) => `/posts/${id}`,
};

// For Backend API endpoints
export const apiPaths = {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    getPosts: '/api/posts',
    getProfilePost: "/myPost",
    getPostById: (id: string) => `/api/posts/${id}`,
};
