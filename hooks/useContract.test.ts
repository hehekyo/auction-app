import { useAuctionContract } from "./useContract";

describe("useContract", () => {
  it("should return the contract", () => {
    const contract = useAuctionContract();
    expect(contract).toBeDefined();
    console.log("============useContract.test.ts", contract);
  });
});
