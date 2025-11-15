import { useRoute, Link } from "wouter-preact";
import { getPost } from "../news/loader";
import { useMetaTags } from "../hooks/useMetaTags";
import { formatDisplayDateTime } from "../utils/date";

export default function NewsPost() {
    const [, params] = useRoute("/news/:slug");
    const slug = params?.slug || "";
    const post = getPost(slug);
    const metaTitle = post?.title ?? "Novica ni bila najdena";
    const metaDescription = post?.excerpt ?? "Preberi najnovejše dogajanje Zasedbe Kranjci.";
    const path = slug ? `/news/${slug}` : "/news";

    useMetaTags({
        title: metaTitle,
        description: metaDescription,
        path,
        type: "article"
    });

    if (!post) {
        return <div class="container"><h2>404</h2>Prispevka ni.</div>;
    }

    return (
        <div class="container news-post">
            <p class="news-post__back"><Link href="/news">← Nazaj na novice</Link></p>
            <h1 class="news-post__title">{post.title}</h1>
            <div class="news-post__meta">{formatDisplayDateTime(post.date, post.time)}</div>
            <article class="card news-post__content">
                {post.cover && (
                    <div class="news-post__media">
                        <img src={post.cover} alt="" />
                    </div>
                )}
                <div class="news-post__body" dangerouslySetInnerHTML={{ __html: post.html }} />
            </article>
        </div>
    );
}
