#!/usr/bin/env python3
"""
Debug script to understand CarSensor gallery navigation
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

def debug_carsensor_gallery():
    options = Options()
    # Remove headless to see what's happening
    # options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=options)
    
    try:
        print("=== LOADING PAGE ===")
        driver.get('https://www.carsensor.net/usedcar/detail/AU6450744071/index.html')
        time.sleep(5)
        
        print("\n=== INITIAL STATE ===")
        main_photo = driver.find_element(By.ID, "js-mainPhoto")
        print(f"Main photo src: {main_photo.get_attribute('src')}")
        
        # Check what thumbnails exist
        thumbnails = driver.find_elements(By.CSS_SELECTOR, "a.js-photo")
        print(f"Found {len(thumbnails)} thumbnail elements")
        
        print("\n=== CLICKING GALLERY EXPANSION ===")
        expansion_btn = driver.find_element(By.CSS_SELECTOR, "div.detailSlider__expansion")
        driver.execute_script("arguments[0].click();", expansion_btn)
        time.sleep(3)
        
        print("\n=== AFTER EXPANSION ===")
        main_photo = driver.find_element(By.ID, "js-mainPhoto")
        print(f"Main photo src: {main_photo.get_attribute('src')}")
        
        # Check thumbnails again
        thumbnails = driver.find_elements(By.CSS_SELECTOR, "a.js-photo")
        print(f"Found {len(thumbnails)} thumbnail elements after expansion")
        
        print("\n=== CLICKING FIRST THUMBNAIL ===")
        if thumbnails:
            driver.execute_script("arguments[0].click();", thumbnails[0])
            time.sleep(2)
            main_photo = driver.find_element(By.ID, "js-mainPhoto")
            print(f"Main photo after thumbnail click: {main_photo.get_attribute('src')}")
        
        print("\n=== TESTING NEXT BUTTON CLICKS ===")
        images_found = []
        for i in range(10):  # Try 10 clicks
            try:
                main_photo = driver.find_element(By.ID, "js-mainPhoto")
                current_src = main_photo.get_attribute('src')
                
                if current_src not in images_found:
                    images_found.append(current_src)
                    print(f"Image {len(images_found)}: {current_src}")
                
                # Click next
                next_btn = driver.find_element(By.ID, "js-nextPhoto")
                if next_btn.is_enabled():
                    driver.execute_script("arguments[0].click();", next_btn)
                    time.sleep(1)
                else:
                    print("Next button disabled")
                    break
                    
            except Exception as e:
                print(f"Error on click {i}: {e}")
                break
        
        print(f"\n=== TOTAL UNIQUE IMAGES FOUND: {len(images_found)} ===")
        for i, img in enumerate(images_found, 1):
            print(f"{i}. {img}")
            
        input("Press Enter to close browser...")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    debug_carsensor_gallery()