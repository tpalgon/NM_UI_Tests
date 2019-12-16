const {
  Builder,
  By,
  until,
  Key
} = require("selenium-webdriver"),
  chrome = require("selenium-webdriver/chrome"),
  firefox = require("selenium-webdriver/firefox"),
  chai = require("chai"),
  expect = chai.expect, {
    username,
    password
  } = require("../credentials");
chai.use(require("chai-as-promised"));

describe("workflow for saucedemo", function() {
  let driver;
  let url = "https://www.saucedemo.com/";
  before("setup driver", async function() {
    this.timeout(20000);
    driver = await new Builder()
      .forBrowser("firefox")
      .build();
  });
  it("Login, sort items, add two items, visit shopping cart", async function() {
    try {
      this.timeout(20000);
      await driver.get(url);
      let usernameElem = "user-name";
      let passwordElem = "password";
      let usernameInput = await driver.findElement(By.id(usernameElem));
      //type username
      await usernameInput.sendKeys(username);
      let passwordInput = await driver.findElement(By.id(passwordElem));
      //type password
      await passwordInput.sendKeys(password);
      let submitButton = await driver.findElement(By.className("btn_action"));
      await submitButton.click();
      //select z to a filter
      let sortElem = await driver.findElement(By.css("#inventory_filter_container > select > option[value = \"za\"]"));
      await sortElem.click();
      //find first add to cart button
      let addToCart1 = await driver.executeScript("return document.getElementsByClassName(\"btn_primary btn_inventory\")[0]");
      //save first item name
      let firstItemTitle = await driver.executeScript("return document.getElementsByClassName(\"inventory_item_name\")[0].textContent");
      //add first item
      await addToCart1.click();
      //find second add to cart button
      let addToCart2 = await driver.executeScript("return document.getElementsByClassName(\"btn_primary btn_inventory\")[0]");
      //save second item name
      let secondItemTitle = await driver.executeScript("return document.getElementsByClassName(\"inventory_item_name\")[1].textContent");
      //add second item
      let expectedItemsInCart = firstItemTitle + secondItemTitle;
      await addToCart2.click();
      let cartPageElem = await driver.findElement(By.id("shopping_cart_container"));
      //go to shopping cart page
      await cartPageElem.click();
      //javascript for getting all item names in cart
      let actualItemsInCart = await driver
        .executeScript("let titles = []; let items = document.getElementsByClassName(\"inventory_item_name\"); for(i=0;i<items.length;i++){titles += items[i].innerText} return titles")
        .then(actualItemsInCart => {
          //console.log(actualItemsInCart);
          expect(actualItemsInCart).to.equal(expectedItemsInCart);
        })
    } catch (err) {
      console.log(err);
    }
  });
  it("remove item, continue shopping, add item", async function() {
    this.timeout(20000);
    try {
      //remove first item from cart
      let removeItem = await driver.executeScript("return document.getElementsByClassName(\"btn_secondary cart_button\")[0]");
      await removeItem.click();
      //continue shopping
      let continueShopping = await driver.executeScript("return document.querySelector(\"div.cart_footer > a.btn_secondary\");");
      await continueShopping.click();
      //add new item to cart
      let addToCart1 = await driver.executeScript("return document.getElementsByClassName(\"btn_primary btn_inventory\")[0]");
      await addToCart1.click();
      //return to cart page
      let cartPageElem = await driver.findElement(By.id("shopping_cart_container"));
      await cartPageElem.click();
      let actualItemsInCart2 = await driver
        .executeScript("let newTitles = []; let items = document.getElementsByClassName(\"inventory_item_name\"); for(i=0;i<items.length;i++){newTitles += items[i].innerText} return newTitles")
      let priceOfCart = await driver
        .executeScript("let prices = []; let items = document.getElementsByClassName(\"inventory_item_price\"); for(i=0;i<items.length;i++){prices += items[i].innerText+\",\"} return prices");
      let prices = priceOfCart.split(",");
      prices.pop();
      let total = 0;
      for (i = 0; i < prices.length; i++) {
        total += parseFloat(prices[i]);
      }
      let checkout = await driver.executeScript("return document.getElementsByClassName(\"btn_action checkout_button\")[0]");
      await checkout.click();
      //input all my checkout info
      let firstnameElem = "first-name"
      let firstNameInput = await driver.findElement(By.id(firstnameElem));
      await firstNameInput.sendKeys("Testname");
      let lastnameElem = "last-name"
      let lastNameInput = await driver.findElement(By.id(lastnameElem));
      await lastNameInput.sendKeys("Testlastname");
      let postalCodeElem = "postal-code"
      let postalCodeInput = await driver.findElement(By.id(postalCodeElem));
      await postalCodeInput.sendKeys("10000");
      let continueButton = await driver.executeScript("return document.getElementsByClassName(\"btn_primary cart_button\")[0]");
      await continueButton.click();
      let actualItemsInCheckout = await driver
        .executeScript("let newTitles = []; let items = document.getElementsByClassName(\"inventory_item_name\"); for(i=0;i<items.length;i++){newTitles += items[i].innerText} return newTitles")
      //assert correct items in cart
      expect(actualItemsInCheckout).to.equal(actualItemsInCart2);
      let actualTotal = await driver.executeScript("return document.getElementsByClassName(\"summary_subtotal_label\")[0].innerText")
      let indexOfDollarSign = actualTotal.indexOf("$");
      actualTotal = actualTotal.substring(indexOfDollarSign + 1);
      let actualTotalFloat = parseFloat(actualTotal);
      //assert price
      expect(actualTotalFloat).to.equal(total);
      let checkoutFinal = await driver.executeScript("return document.getElementsByClassName(\"btn_action cart_button\")[0]");
      await checkoutFinal.click();
    } catch (err) {
      console.log(err);
    }
    finally{
      driver.quit();
    }
  });
});
