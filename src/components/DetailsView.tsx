import React, { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import 'styles/DetailsView.scss';

type Props = {
  id: string;
  title?: string;
  titleAddition?: string;
  state: 'loading' | 'error' | 'success';
  buttons: JSX.Element;
  linkTo?: string;
  children: ReactNode;
};

const DetailsView: FC<Props> = ({
  id,
  title,
  titleAddition,
  state,
  buttons,
  linkTo,
  children,
}) => {
  const headerDetails = title && (
    <div className="details-details">
      <h2>{title} </h2>
      <span className="small">{titleAddition}</span>
    </div>
  );

  let content;
  if (state === 'loading') {
    content = (
      <div className="details-view loading">
        Ladataan tietoja (id: {id}) ...
      </div>
    );
  } else if (state === 'error') {
    content = (
      <div className="details-view error-message">
        Tietoja ei saatu (id: {id}).
      </div>
    );
  } else {
    content = children;
  }

  return (
    <div className="details-view">
      <div className="details-header">
        {linkTo ? <Link to={linkTo}>{headerDetails}</Link> : headerDetails}
        <div className="buttons">{buttons}</div>
      </div>
      {content}
      <div className="divider" />
    </div>
  );
};

export default DetailsView;
