import { useEffect, useState } from 'react';

import { PostDetail } from './PostDetail';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line
const maxPostPage = 10;

async function fetchPosts(pageNum) {
	const response = await fetch(
		`https://jsonplaceholder.typicode.com/posts?_limit=${maxPostPage}&_page=${pageNum}`
	);
	return response.json();
}

export function Posts() {
	// eslint-disable-next-line
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedPost, setSelectedPost] = useState(null);

	const queryClient = useQueryClient();

	useEffect(() => {
		if (currentPage >= maxPostPage) return;
		const nextPage = currentPage + 1;
		queryClient.prefetchQuery({
			queryKey: ['posts', nextPage],
			queryFn: () => fetchPosts(nextPage),
		});
	}, [currentPage, queryClient]);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['posts', currentPage],
		queryFn: () => fetchPosts(currentPage),
		staleTime: 2000,
		keepPreviousData: true,
	});
	if (isLoading) return <h3>Loading...</h3>;
	if (isError)
		return (
			<>
				<h3>Something went wrong</h3>
				<p>{error.toString()}</p>
			</>
		);
	return (
		<>
			<ul>
				{data.map((post) => (
					<li
						key={post.id}
						className='post-title'
						onClick={() => setSelectedPost(post)}
					>
						{post.title}
					</li>
				))}
			</ul>
			<div className='pages'>
				<button
					disabled={currentPage <= 1}
					onClick={() => {
						setCurrentPage((curPage) => curPage - 1);
					}}
				>
					Previous page
				</button>
				<span>Page {currentPage}</span>
				<button
					disabled={currentPage >= maxPostPage}
					onClick={() => {
						setCurrentPage((curPage) => curPage + 1);
					}}
				>
					Next page
				</button>
			</div>
			<hr />
			{selectedPost && <PostDetail post={selectedPost} />}
		</>
	);
}
