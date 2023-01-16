import { FC } from 'react';
import { Helmet } from 'react-helmet';

const Head: FC<{ title?: string; description?: string }> = ({
  title = 'Nearsend | Bulksend NEAR and NEP-141 Tokens',
  description = 'Send NEAR or NEP-141 Tokens to thousands of NEAR addresses in one click. Nearsend allows you to bulksend or multisend Near Protocol tokens in one transaction.',
}) => {
  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
    </Helmet>
  );
};

export default Head;
