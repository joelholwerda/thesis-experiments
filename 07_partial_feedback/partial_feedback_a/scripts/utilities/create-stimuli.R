library(magick)
library(tidyverse)
library(magrittr)

# Set working directory--You'll need to change this to the location of the raw images
setwd(file.path("path_to_folder_with_images"))

# List files in stimuli-original folder
files <- list.files("stimuli-original")

# Capture texture name by removing irrelevant parts of file name
stimulus_info <- tibble(id = 1:length(files), 
                        file_name = files) %>%
  mutate(stimulus = file_name %>%  
      str_replace(pattern = "TexturesCom_", replacement = "") %>%
      str_replace(pattern = "_header\\d.jpg", replacement = ""),
    type = stimulus %>% str_replace_all("_[:digit:]+", replacement = "")
    )

# Loop through images in stimuli-orignal folder
for(i in 1:220){

  image <- image_read(file.path("stimuli-original", files[i]))
  
  # Use magick package to resize, recolour, and remove background for blue stimuli
  # Files saved in stimuli-edited folder with their colour and their number in the list
  image %>%
    image_resize(geometry = 500) %>% 
    image_modulate(saturation = 200, hue = 200) %>% 
    image_colorize(opacity = 20, color = "blue") %>% 
    image_fill(color = "black", point = "+1+1", fuzz = 1) %>%
    image_write(path = file.path("stimuli-edited", paste("blue-", i, ".jpg", sep = "")), 
                format = "jpg", quality = 77)
  
  # Do the same thing for the red images
  image %>%
    image_resize(geometry = 500) %>% 
    image_modulate(saturation = 200, hue = 280) %>% 
    image_colorize(opacity = 20, color = "red") %>% 
    image_fill(color = "black", point = "+1+1", fuzz = 1) %>%
    image_write(path = file.path("stimuli-edited", paste("red-", i, ".jpg", sep = "")), 
                format = "jpg", quality = 77)

}
