import React, {Fragment} from 'react';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import './style.scss';

class ImageCrop extends React.Component {
  state = {
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 16 / 9,
    croppedAreaPixels: null,
  }

  onCropChange = crop => {
    this.setState({ crop })
  }

  onCropComplete = (croppedArea, croppedAreaPixels) => {
    // console.log(croppedArea, croppedAreaPixels)
    this.setState({ croppedAreaPixels});
  }

  onZoomChange = zoom => {
    this.setState({ zoom })
  }

  onCropSave = async () => {
    const croppedImage = await getCroppedImg(this.props.imageSrc, this.state.croppedAreaPixels);
    // console.log(croppedImage)
    this.props.onCropConfirm(croppedImage);
  }

  render() {
    return (
      <div className="image-crop">
        {
          this.props.imageSrc && <Fragment>
            <div className="crop-container">
              <Cropper
                image={this.props.imageSrc}
                crop={this.state.crop}
                zoom={this.state.zoom}
                aspect={this.state.aspect}
                onCropChange={this.onCropChange}
                onCropComplete={this.onCropComplete}
                onZoomChange={this.onZoomChange}
              />
            </div>
            <div className="d-flex mt-4">
                <div className="controls mr-auto">
                <Slider
                    value={this.state.zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    tooltip={false}
                    aria-labelledby="Zoom"
                    onChange={this.onZoomChange}
                />
                </div>
                <div className="buttons">
                    <button className="btn btn-light mr-3" onClick={this.props.onCropCancel}>Cancel</button>
                    <button className="btn btn-primary" onClick={this.onCropSave}>Save</button>
                </div>
            </div>
            </Fragment>
        }
      </div>
    )
  }
}

export default ImageCrop;