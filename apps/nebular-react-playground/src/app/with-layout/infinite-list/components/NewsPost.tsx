import { NewsPostModel } from '../model';

export type NewsPostProps = {
  newsPost: NewsPostModel;
};

export function NewsPost({ newsPost }: NewsPostProps) {
  return (
    <article>
      <h2 className="h5">{newsPost.title}</h2>
      <p>{newsPost.text}</p>
      <a href={newsPost.link}>Read full article</a>
    </article>
  );
}
