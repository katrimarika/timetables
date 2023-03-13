import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../utils/classNames';
import { RawDetail } from '../utils/uiContext';
import styles from './DetailsView.module.css';
import Divider from './Divider';
import SaveButtons from './SaveButtons';

type Props = {
  id: string;
  title?: string;
  titleAddition?: string;
  state: 'loading' | 'error' | 'success';
  detailForSaving: RawDetail;
  linkTo?: string;
  children: ReactNode;
};

const DetailsView: FC<Props> = ({
  id,
  title,
  titleAddition,
  state,
  detailForSaving,
  linkTo,
  children,
}) => {
  const headerDetails = title && (
    <div className={styles['details-details']}>
      <h2 className={styles['details-heading']}>{title} </h2>
      <small>{titleAddition}</small>
    </div>
  );

  let content;
  if (state === 'loading') {
    content = (
      <div className={cx(styles['details-view'], styles.loading)}>
        Ladataan tietoja (id: {id}) ...
      </div>
    );
  } else if (state === 'error') {
    content = (
      <div className={cx(styles['details-view'], styles['error-message'])}>
        Tietoja ei saatu ladattua (id: {id}).
      </div>
    );
  } else {
    content = children;
  }

  return (
    <div className={styles['details-view']}>
      <div className={styles['details-header']}>
        {linkTo ? <Link to={linkTo}>{headerDetails}</Link> : headerDetails}
        <div className={styles.buttons}>
          <SaveButtons detail={detailForSaving} />
        </div>
      </div>
      {content}
      <Divider />
    </div>
  );
};

export default DetailsView;
