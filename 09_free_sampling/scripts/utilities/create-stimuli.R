library(magick)
library(tidyverse)
library(magrittr)

setwd(file.path("C:", "Users", "jholwerda", "Desktop"))

files <- list.files("stimuli-original")
stimulus_info <- tibble(id = 1:length(files), 
                        file_name = files) %>%
  mutate(stimulus = file_name %>%  
      str_replace(pattern = "TexturesCom_", replacement = "") %>%
      str_replace(pattern = "_header\\d.jpg", replacement = ""),
    type = stimulus %>% str_replace_all("_[:digit:]+", replacement = "")
    )

for(i in 211:221){

  
  image <- image_read(file.path("stimuli-original", files[i]))
  
  image %>%
    image_resize(geometry = 500) %>% 
    image_modulate(saturation = 200, hue = 200) %>% 
    image_colorize(opacity = 20, color = "blue") %>% 
    image_fill(color = "black", point = "+1+1", fuzz = 1) %>%
    image_write(path = file.path("stimuli-edited", paste("blue-", i, ".jpg", sep = "")), 
                format = "jpg", quality = 77)
  
  image %>%
    image_resize(geometry = 500) %>% 
    image_modulate(saturation = 200, hue = 280) %>% 
    image_colorize(opacity = 20, color = "red") %>% 
    image_fill(color = "black", point = "+1+1", fuzz = 1) %>%
    image_write(path = file.path("stimuli-edited", paste("red-", i, ".jpg", sep = "")), 
                format = "jpg", quality = 77)

}

