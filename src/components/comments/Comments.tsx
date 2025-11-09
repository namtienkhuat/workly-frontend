const Comments = () => {

  // Temporary sample data
  const comments = [
    {
      id: 1,
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem neque aspernatur ullam aperiam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem neque aspernatur ullam aperiam",
      name: "John Doe",
      userId: 1,
      profilePicture:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 2,
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem neque aspernatur ullam aperiam",
      name: "Jane Doe",
      userId: 2,
      profilePicture:
        "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
  ];

  return (
    <div className="w-full">
      {/* Write comment */}
      <div className="flex items-center justify-between gap-5 my-5">
        <img
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
        <input
          type="text"
          placeholder="Write a comment..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer transition">
          Send
        </button>
      </div>

      {/* Comment list */}
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex justify-between gap-5 my-6 border-b border-gray-100 dark:border-gray-700 pb-4"
        >
          <img
            src={comment.profilePicture}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 flex flex-col gap-1">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {comment.name}
            </span>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {comment.desc}
            </p>
          </div>
          <span className="text-gray-400 text-xs self-center">1 hour ago</span>
        </div>
      ))}
    </div>
  );
};

export default Comments;
