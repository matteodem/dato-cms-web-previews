import { json } from '@sveltejs/kit';

const generatePreviewUrl = ({ item, itemType, locale }: any) => {
	switch (itemType.attributes.api_key) {
		case 'landing_page':
			return `/landing-pages/${item.attributes.slug}`;
		case 'blog_post':
			// blog posts are localized:
			const localePrefix = locale === 'en' ? '' : `/${locale}`;
			return `${localePrefix}/blog/${item.attributes.slug[locale]}`;
		case 'post':
			return item.attributes.slug;
		default:
			return null;
	}
};

export async function OPTIONS() {
	return json('ok');
}

export async function POST({ request, setHeaders }) {
	setHeaders({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Content-Type': 'application/json'
	});

	const data = await request.json();

	const url = generatePreviewUrl(data);

	console.log(data);

	if (!url) {
		return json({ previewLinks: [] });
	}

	const baseUrl = process.env.VERCEL_URL
		? // Vercel auto-populates this environment variable
		  `https://${process.env.VERCEL_URL}`
		: // Netlify auto-populates this environment variable
		  process.env.URL;

	console.log({ baseUrl });

	const previewLinks = [
		// Public URL:
		{
			label: 'Published version',
			url: `${baseUrl}${url}`
		},
		// This requires an API route on your project that starts Next.js Preview Mode
		// and redirects to the URL provided with the `redirect` parameter:
		{
			label: 'Draft version',
			url: `${baseUrl}/api/start-preview-mode?redirect=${url}&secret=${process.env.PREVIEW_MODE_SECRET}`
		}
	];

	return json({ previewLinks });
}
