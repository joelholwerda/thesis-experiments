library(tidyverse)
library(jsonlite)

n_participants = 120

condition_array <- c(rep(0, (n_participants / 2)), rep(1, (n_participants / 2)))

order <- sample(condition_array, size = n_participants, replace = FALSE)


write_json(order, path = "participant-order.JSON", pretty = TRUE)

