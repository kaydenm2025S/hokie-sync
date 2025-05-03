import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

def scrape_all_headless_with_catch():
    # load your term→subject mapping
    with open('fall.json') as f:
        term_subjects = json.load(f)

    # set up headless Chrome
    opts = Options()
    opts.add_argument("--headless")       # ← run headless if you want
    service = Service()
    driver  = webdriver.Chrome(service=service, options=opts)
    wait    = WebDriverWait(driver, 4)
    headers = [
    "CRN",
    "Course",
    "Title",
    "Schedule Type",
    "Modality",
    "Credits",
    "Capacity",
    "Instructor",
    "Days",
    "Begin",
    "End",
    "Location",
    "Exam",
    # …etc…
    ]

    all_data = {}
    count = 0
    try:
        for term, subjects in term_subjects.items():
            term_data = {}
            for subj in subjects:
                code = subj['code']
                # load the term page
                driver.get(
                  f'https://banweb.banner.vt.edu/ssb/prod/HZSKVTSC.P_ProcRequest'
                  f'?TERMYEAR={term}&CAMPUS=0'
                )

                # wait for the subject dropdown (or skip on timeout)
                try:
                    wait.until(EC.presence_of_element_located((By.NAME, 'subj_code')))
                except TimeoutException:
                    term_data[code] = []
                    continue

                # select subject, clear CRN, submit
                Select(driver.find_element(By.NAME, 'subj_code')) \
                    .select_by_value(code)
                driver.find_element(By.NAME, 'CRSE_NUMBER').clear()
                driver.find_element(By.NAME, 'BTN_PRESSED').click()

                # wait for the results table
                try:
                    table = wait.until(EC.presence_of_element_located(
                        (By.CLASS_NAME, 'dataentrytable')
                    ))
                except TimeoutException:
                    term_data[code] = []
                    continue

                sections = []
                for row in table.find_elements(By.XPATH, ".//tr[not(@class)]"):
                    cells = [td.text.strip() for td in row.find_elements(By.TAG_NAME, 'td')]
                    sections.append(dict(zip(headers, cells)))
                count += 1
                print(count)

                term_data[code] = sections

            all_data[term] = term_data

    finally:
        # only now do we tear down the browser
        driver.quit()

    # write everything out once
    with open('courses.json', 'w') as f:
        json.dump(all_data, f, indent=2)

if __name__ == '__main__':
    scrape_all_headless_with_catch()
