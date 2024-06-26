import {
  createProductForTest,
  loginUserForTest,
  signupUserHelper,
} from "tests/helper";
import { IProduct } from "./products.model";
import { testDB } from "libs/db";
import { TEST_PRODUCT, TEST_PRODUCTS } from "tests/constant";

describe("Find by Id", () => {
  let products: IProduct[];

  beforeAll(async () => {
    await testDB.connect();
    products = await createProductForTest();
  });

  afterAll(async () => {
    await testDB.disconnect();
  });

  it("find product by id", async () => {
    try {
      const product = products[2];
      const res = await testDB
        .request()
        .get(`/products/${product._id}`)
        .set("Content-Type", "application/json");
      expect(res.status).toBe(200);
    } catch (e) {
      throw e;
    }
  });
});

describe("Find Product", () => {
  beforeAll(async () => {
    await testDB.connect();
    await createProductForTest();
  });

  afterAll(async () => {
    await testDB.disconnect();
  });

  it("Find all products", async () => {
    try {
      const res = await testDB
        .request()
        .get("/products")
        .set("Content-Type", "application/json");
      expect(res.status).toBe(200);
    } catch (e) {
      throw e;
    }
  });
});

describe("Create a new Product", () => {
  let accessToken: string;
  beforeAll(async () => {
    await testDB.connect();
    const response = await signupUserHelper();
    accessToken = response.accessToken;
  });
  afterAll(async () => {
    await testDB.disconnect();
  });
  it("should create a new product successfully", async () => {
    const res = await testDB
      .request()
      .post("/products")
      .send(TEST_PRODUCT)
      .set("authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});

describe("Delete Product", () => {
  let accessToken: string = "";
  let products: IProduct[];

  beforeAll(async () => {
    await testDB.connect();
    products = await createProductForTest();

    const response = await loginUserForTest();
    accessToken = response.accessToken;
  });

  afterAll(async () => {
    await testDB.disconnect();
  });

  it("should delete product", async () => {
    const product = products[2];
    const productId = String(product._id);
    const res = await testDB
      .request()
      .delete(`/products/${productId}`)
      .set("authorization", `Bearer ${accessToken}`)
      .send({ is_deleted: true });
    const body = res.body;
    expect(res.statusCode).toBe(200);
    expect(body.message).toBe("Product deleted successfully");
  });

  it("should not delete if not owner of the product", async () => {
    const product = products[1];
    const productId = String(product._id);
    const newUserRes = await signupUserHelper({
      email: "anotheruser@test.com",
      password: "password",
    });
    const res = await testDB
      .request()
      .delete(`/products/${productId}`)
      .send({ is_deleted: true })
      .set("authorization", `Bearer ${newUserRes.accessToken}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Unauthorized request");
  });
});

describe("Edit product", () => {
  let products: IProduct[];
  let accessToken: string;
  beforeAll(async () => {
    await testDB.connect();
    const pd = await createProductForTest();
    products = pd;
    const response = await loginUserForTest();
    accessToken = response.accessToken;
  });
  afterAll(async () => {
    await testDB.disconnect();
  });
  it("should edit product", async () => {
    try {
      let product = products[2];
      const productId = String(product._id);
      const res = await testDB
        .request()
        .put(`/products/${productId}`)
        .set("authorization", `Bearer ${accessToken}`)
        .send(TEST_PRODUCT);
      expect(res.status).toBe(200);
    } catch (e) {
      throw e;
    }
  });
  it("should not edit if not owner of tag", async () => {
    try {
      const product = products[2];
      const newUserRes = await signupUserHelper({
        email: "another5@gmail.com",
        password: "password",
      });
      const res = await testDB
        .request()
        .put(`/products/${product._id}`)
        .send(TEST_PRODUCT)
        .set("authorization", `Bearer ${newUserRes.accessToken}`);
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Unauthorized request");
    } catch (e) {
      throw e;
    }
  });
});
