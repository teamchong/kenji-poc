import json
import re
import subprocess

query = 'summer'

def doSearch(query):
    process = subprocess.Popen([
        'docker-compose build --parallel --build-arg QUERY=\'' +
        query +
        '\' && docker-compose up --quiet-pull'], 
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT,
        shell=True)
    proc_stdout = process.communicate()[0].strip()
    
    output = re.search(re.escape('!#RESULT-FOR-' + query + '#!') + '([^\\n]+)', proc_stdout)
    return output

def toJson(output):
    return json.loads(output.group(1))

output = doSearch(query)

retryCount = 5

while not output and retryCount > 0:
    retryCount -= 1
    output = doSearch(query)

if output:
    print(toJson(output))
else:
    print('fail')
