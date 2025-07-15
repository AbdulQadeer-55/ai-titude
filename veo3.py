import streamlit as st
import time
from google import genai
from google.genai import types
import os

client = genai.Client(api_key="AIzaSyBv_SgTj-sLVc_lANCPoXBsBXejDI55ou0")
st.title("Veo Video Generator")
st.write("Generate cinematic videos using Google's Veo model with a text prompt or an optional image.")

with st.form("video_form"):
    prompt = st.text_area("Enter your video prompt", 
                         value="Panning wide shot of a calico kitten sleeping in the sunshine",
                         help="Describe the video content, including subject, action, style, and camera motion.")
    
    aspect_ratio = st.selectbox("Aspect Ratio", ["16:9", "9:16"], index=0)
    person_generation = st.selectbox("Person Generation", ["dont_allow", "allow_adult"], index=0)
    duration_seconds = st.slider("Video Duration (seconds)", min_value=5, max_value=8, value=5)
    number_of_videos = st.selectbox("Number of Videos", [1, 2], index=0)
    use_image = st.checkbox("Generate video from an image", value=False)
    
    submit_button = st.form_submit_button("Generate Video")

def generate_and_save_video(prompt, aspect_ratio, person_generation, duration_seconds, number_of_videos, image=None):
    config = types.GenerateVideosConfig(
        person_generation=person_generation,
        aspect_ratio=aspect_ratio,
        duration_seconds=duration_seconds,
        number_of_videos=number_of_videos
    )
    
    if image:
        operation = client.models.generate_videos(
            model="veo-2.0-generate-001",
            prompt=prompt,
            image=image,
            config=config
        )
    else:
        operation = client.models.generate_videos(
            model="veo-2.0-generate-001",
            prompt=prompt,
            config=config
        )
    
    with st.spinner("Generating video... This may take 2-3 minutes or longer."):
        while not operation.done:
            time.sleep(20)
            operation = client.operations.get(operation)
    
    video_files = []
    for n, generated_video in enumerate(operation.response.generated_videos):
        client.files.download(file=generated_video.video)
        filename = f"video{n}.mp4"
        generated_video.video.save(filename)
        video_files.append(filename)
    
    return video_files

def generate_image(prompt, aspect_ratio):
    imagen = client.models.generate_images(
        model="imagen-3.0-generate-002",
        prompt=prompt,
        config=types.GenerateImagesConfig(
            aspect_ratio=aspect_ratio,
            number_of_images=1
        )
    )
    return imagen.generated_images[0].image

if submit_button:
    try:
        if use_image:
            with st.spinner("Generating image..."):
                image = generate_image(prompt, aspect_ratio)
            st.image(image, caption="Generated Image for Video")
            video_files = generate_and_save_video(
                prompt, aspect_ratio, person_generation, duration_seconds, number_of_videos, image
            )
        else:
            video_files = generate_and_save_video(
                prompt, aspect_ratio, person_generation, duration_seconds, number_of_videos
            )
        
        for video_file in video_files:
            st.video(video_file)
            st.write(f"Saved as: {video_file}")
            if os.path.exists(video_file):
                os.remove(video_file)
    
    except Exception as e:
        st.error(f"An error occurred: {str(e)}")
        st.info("This may be due to resource constraints. Please try again later.")