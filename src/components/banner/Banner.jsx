import React from 'react'
import { Carousel } from 'antd';

export default function Banner() {

  return (
    <Carousel autoplay>
      <div className="w-full rounded-lg page-relative">
        <img
          className="h-100 w-full"
          src="https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/nam-moi-2024/thang-42025/1600x635-1.jpg"
        ></img>
      </div>
      <div>
        <img
          className="h-100 w-full"
          src="https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/nam-moi-2024/thang-42025/834x635px.jpg"
        ></img>
      </div>
      <div>
        <img
          className="h-100 w-full"
          src="https://js0fpsb45jobj.vcdn.cloud/storage/upload/media/nam-moi-2024/thangs2025/1600x635-4.jpg"
        ></img>
      </div>
    </Carousel>
  );
}
