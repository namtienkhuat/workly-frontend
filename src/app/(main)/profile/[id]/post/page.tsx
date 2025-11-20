import Posts from '@/components/posts/Posts';
import UploadPostModal from '@/components/UploadPost/UploadPost';
import React from 'react';

const CompanyPost = () => {
    return <div>
        <UploadPostModal />
        <Posts />
    </div>;
};

export default CompanyPost;
