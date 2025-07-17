export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-Qd9zhDUoN6EWypvRGmKZ8k"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
cd /home/ubuntu && pip3 install openpyxl
cd /home/ubuntu && python3 criar_planilha_cronograma.py
