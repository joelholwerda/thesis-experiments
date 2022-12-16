library(tidyverse)
library(truncnorm)
library(jsonlite)

sampleOutcomes <- function(n = 100, mean = 50, sd_safe = 1, sd_risky = 20){
  
  outcomes <- list(
    safe = rnorm(n, mean = mean, sd = sd_safe) %>%  round(),
    risky = rtruncnorm(n, a = 10, b = 90, mean = mean, sd = sd_risky) %>% round()
  )
}

outcomes <- list(
  a = sampleOutcomes(),
  b = sampleOutcomes(),
  c = sampleOutcomes(),
  d = sampleOutcomes(),
  e = sampleOutcomes(),
  f = sampleOutcomes(),
  g = sampleOutcomes(),
  h = sampleOutcomes(),
  i = sampleOutcomes(),
  j = sampleOutcomes()
)

write_json(outcomes, path = "outcomes.JSON", pretty = TRUE)
