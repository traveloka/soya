import React from 'react';
import PhotoCaption from './PhotoCaption.js';

import url from './mountains.jpg';

export default class PhotoCaptionThumbView extends React.Component {
  render() {
    return <div>
      <PhotoCaption url={url} caption={"Photo by Brandon Lam"} width={300} />
    </div>;
  }
}