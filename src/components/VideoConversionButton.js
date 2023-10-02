import { Button } from "antd";
import { fetchFile } from "@ffmpeg/ffmpeg";
import { sliderValueToVideoTime } from "../utils/utils";

function VideoConversionButton({
  videoPlayerState,
  sliderValues,
  videoFile,
  ffmpeg,
  onConversionStart = () => {},
  onConversionEnd = () => {},
  onTrimVideo = () => {},
}) {
  const trimVideo = async () => {
    // starting the conversion process
    onConversionStart(true);

    const inputFileName = "input.mp4";
    const outputFileName = "output.mp4";

    // writing the video file to memory
    ffmpeg.FS("writeFile", inputFileName, await fetchFile(videoFile));

    console.log(videoFile, "videoFile");

    const [min, max] = sliderValues;
    const minTime = sliderValueToVideoTime(videoPlayerState.duration, min);
    const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max);

    // cutting the video and converting it to GIF with a FFMpeg command
    await ffmpeg.run(
      "-i",
      inputFileName,
      "-ss",
      `${minTime}`,
      "-to",
      `${maxTime}`,
      "-f",
      "mp4",
      outputFileName
    );

    // reading the resulting file
    const data = ffmpeg.FS("readFile", outputFileName);

    // converting the GIF file created by FFmpeg to a valid image URL
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: videoFile.type })
    );

    onTrimVideo(url);

    // ending the conversion process
    onConversionEnd(false);
  };

  return <Button onClick={() => trimVideo()}>Crop</Button>;
}

export default VideoConversionButton;
