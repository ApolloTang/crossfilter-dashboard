#!/bin/bash

# http-server ./resources -p 9088 &
browser-sync start --port '3088' --server 'src' --files 'src' --directory &
wait;



