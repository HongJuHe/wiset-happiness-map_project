import tensorflow as tf
import tensorflow_hub as hub

import matplotlib.pyplot as plt
import tempfile
from six.moves.urllib.request import urlopen
from six import BytesIO

import numpy as np
from PIL import Image
from PIL import ImageColor
from PIL import ImageDraw
from PIL import ImageFont
from PIL import ImageOps

import time
import os
import sys


def display_image(image):
    fig = plt.figure(figsize=(15, 20))
    plt.grid(False)
    plt.axis('off')
    plt.imshow(image)


def draw_bounding_box_on_image(image, ymin, xmin, ymax, xmax, color, font, thickness=4, display_str_list=()):
    draw = ImageDraw.Draw(image)
    im_width, im_height = image.size
    (left, right, top, bottom) = (xmin*im_width,
                                  xmax*im_width, ymin*im_height, ymax*im_height)
    draw.line([(left, top), (left, bottom), (right, bottom),
               (right, top), (left, top)], width=thickness, fill=color)

    display_str_heights = [font.getsize(ds)[1] for ds in display_str_list]
    total_display_str_height = (1+2*0.05) * sum(display_str_heights)

    if top > total_display_str_height:
        text_bottom = top
    else:
        text_bottom = bottom + total_display_str_height

    for display_str in display_str_list[::-1]:
        text_width, text_height = font.getsize(display_str)
        margin = np.ceil(0.05*text_height)
        draw.rectangle([(left, text_bottom-text_height-2*margin),
                        (left+text_width, text_bottom)], fill=color)
        draw.text((left+margin, text_bottom-text_height-margin),
                  display_str, fill="black", font=font)
        text_bottom -= text_height - 2 * margin


def draw_boxes(image, boxes, class_names, scores, max_boxes=50, min_score=0.1):
    colors = list(ImageColor.colormap.values())
    font = ImageFont.load_default()
    cnt = 0

    for i in range(min(boxes.shape[0], max_boxes)):
        if scores[i] >= min_score and class_names[i] == b'Stairs':
            ymin, xmin, ymax, xmax = tuple(boxes[i])  # 박스 좌표값
            cnt += 1
            display_str = "{}: {}%".format(
                class_names[i].decode("ascii"), int(100 * scores[i]))
            color = colors[hash(class_names[i]) % len(colors)]
            image_pil = Image.fromarray(np.uint8(image)).convert("RGB")
            draw_bounding_box_on_image(
                image_pil, ymin, xmin, ymax, xmax, color, font, display_str_list=[display_str])
            np.copyto(image, np.array(image_pil))
    print("이미지 추론 갯수(Found %d objects)" % cnt)
    return image


module_handle = "https://tfhub.dev/google/faster_rcnn/openimages_v4/inception_resnet_v2/1"
detector = hub.load(module_handle).signatures['default']


def load_img(path):
    img = tf.io.read_file(path)
    img = tf.image.decode_jpeg(img, channels=3)
    return img


def run_detector(detector, path):
    img = load_img(path)
    converted_img = tf.image.convert_image_dtype(img, tf.float32)[
        tf.newaxis, ...]
    result = detector(converted_img)
    start_time = time.time()  # 현재 컴퓨터 시간
    result = {key: value.numpy() for key, value in result.items()}
    end_time = time.time()  # 현재 컴퓨터 시간 저장 (결과를 돌린 후)

    print("추론 시간(Inference time): ", end_time-start_time)

    # 이미지 내 박스로 entity 및 socres를 추가하여 출력
    image_with_boxes = draw_boxes(img.numpy(
    ), result["detection_boxes"], result["detection_class_entities"], result["detection_scores"])
    display_image(image_with_boxes)


img_dir = 'C:/Users/347/wiset/map/data/'+sys.argv[0]+'jpg'
img = Image.open(img_dir)
img_resize = img.resize((500, 300))
img_resize.save(img_dir)
run_detector(detector, img_dir)
