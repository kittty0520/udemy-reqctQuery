import { useMutation, useQuery } from '@tanstack/react-query';

// eslint-disable-next-line
async function fetchComments(postId) {
	const response = await fetch(
		`https://jsonplaceholder.typicode.com/comments?postId=${postId}`
	);
	return response.json();
}
// eslint-disable-next-line
async function deletePost(postId) {
	const response = await fetch(
		`https://jsonplaceholder.typicode.com/postId/${postId}`,
		{ method: 'DELETE' }
	);
	return response.json();
}
// eslint-disable-next-line
async function updatePost(postId) {
	const response = await fetch(
		`https://jsonplaceholder.typicode.com/postId/${postId}`,
		{ method: 'PATCH', data: { title: 'REACT QUERY FOREVER!!!!' } }
	);
	return response.json();
}

export function PostDetail({ post }) {
	// replace with useQuery
	const { data, isError, isLoading, error } = useQuery({
		queryKey: ['comments', post.id],
		queryFn: () => fetchComments(post.id),
	});

	const deleteMutation = useMutation(() => deletePost(post.id));
	// const deleteMutation = useMutation((postId) => deletePost(postId));
	const updateMutation = useMutation((postId) => updatePost(postId));

	if (isLoading) return <h3>loading...</h3>;
	if (isError) return <h3>Error! {error.toString()}</h3>;
	return (
		<>
			<h3 style={{ color: 'blue' }}>{post.title}</h3>
			<button onClick={() => deleteMutation.mutate(post.id)}>Delete</button>
			{deleteMutation.isError && (
				<p style={{ color: 'red' }}>Error Deleting the post</p>
			)}
			{deleteMutation.isLoading && (
				<p style={{ color: 'purple' }}>Deleting the post</p>
			)}
			{deleteMutation.isSuccess && (
				<p style={{ color: 'green' }}>The post has been deleted</p>
			)}

			<button onClick={() => updateMutation.mutate(post.id)}>Update title</button>
			{updateMutation.isError && (
				<p style={{ color: 'red ' }}>Error updating the post</p>
			)}
			{updateMutation.isLoading && (
				<p style={{ color: 'purple' }}>Updating the post</p>
			)}
			{updateMutation.isSuccess && (
				<p style={{ color: 'green' }}>The post has updated</p>
			)}
			<p>{post.body}</p>
			<h4>Comments</h4>
			{data.map((comment) => (
				<li key={comment.id}>
					{comment.email}: {comment.body}
				</li>
			))}
		</>
	);
}
