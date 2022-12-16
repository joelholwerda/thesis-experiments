setwd(choose.dir())
set.seed(4980832)
n = 130
conditions <- rep(1:2, length.out = n)
order <- sample(conditions, size = n, replace = FALSE)
write.csv(order, file = "randomOrder.csv", row.names = FALSE, col.names = FALSE)
View(order)
