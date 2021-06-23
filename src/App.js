import React, { useRef, useState } from 'react';
import * as faceapi from 'face-api.js'
import { useAsync, useInterval } from 'react-use';
import { Button, Col, Row, Skeleton } from 'antd';

const MODEL_URL = '/models'

const App = () => {
  const [checkinterval, setcheckinterval] = useState(200)
  const [detectinterval, setdetectinterval] = useState(null)
  const [modelLoaded, setmodelLoaded] = useState(false)
  const videoref = useRef(null)
  const overlaycanvasref = useRef(null)
  useAsync(async () => {
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
    return Promise.resolve()
  })
  useAsync(async () => {
    console.log('getting user media', videoref)
    if (!videoref.current) {
      return Promise.resolve()
    }
    console.log('get user media')
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    videoref.current.srcObject = stream
    // const videoEl = $('#inputVideo').get(0)
    // videoEl.srcObject = stream
    return Promise.resolve()
  }, [videoref.current])
  useInterval(() => {
    console.log('check model loaded')
    if (!!faceapi.nets.ssdMobilenetv1.params && 
        !!faceapi.nets.faceLandmark68Net.params &&
        !!faceapi.nets.faceRecognitionNet.params
        ) {
      console.log('model loaded')
      setcheckinterval(null)
      setmodelLoaded(true)
    }
  }, checkinterval)
  useInterval(async () => {
    // face detect
    const videoEl = videoref.current
    const canvas = overlaycanvasref.current
    const result = await faceapi.detectSingleFace(videoEl)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    if (result) {
      // const {
      //   descriptor
      // } = result
      console.log('face detected')
      // setDescriptor(descriptor)
      // if (!currentDescriptor) {
      //   setcurrentDescriptor(descriptor)
      // }
      const dims = faceapi.matchDimensions(canvas, videoEl, true)
      faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))
    }
  }, detectinterval)
  const handleOnPlay = () => {
    setdetectinterval(30)
  }
  const startDetect = () => {
    setdetectinterval(30)
  }
  const stopDetect = () => {
    setdetectinterval(null)
  }
  if (!modelLoaded) {
    return <Skeleton />
  }
  return (
    <React.Fragment>
      <div onLoad={handleOnPlay} style={{position: 'relative'}}>
        <video ref={videoref} autoPlay muted playsInline></video>
        <canvas style={{position: 'absolute', top:0, left:0}} ref={overlaycanvasref} />
      </div>
      <Row>
        <Col>
          <Button onClick={() => startDetect()}>
            Start Face Detect
          </Button>
        </Col>
        <Col>
        <Button onClick={() => stopDetect()}>
            Stop Face Detect
          </Button>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default App;