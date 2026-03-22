import { parsePlayerFormData } from "../../../src/lib/utils/playerForm";

describe("parsePlayerFormData", () => {
  it("normalizes and trims expected fields", () => {
    const formData = new FormData();
    formData.set("nickname", "  Nacho  ");
    formData.set("first_name", "  Ignacio ");
    formData.set("last_name", " Revainera ");
    formData.set("birth_date", " 1990-01-01 ");
    formData.set("preferred_foot", "right");
    formData.set("is_guest", "on");

    const result = parsePlayerFormData(formData);

    expect(result).toEqual({
      nickname: "Nacho",
      first_name: "Ignacio",
      last_name: "Revainera",
      birth_date: "1990-01-01",
      preferred_foot: "right",
      is_guest: true,
    });
  });

  it("maps invalid preferred_foot to null and empty text fields to null", () => {
    const formData = new FormData();
    formData.set("nickname", "Player");
    formData.set("first_name", "");
    formData.set("last_name", " ");
    formData.set("birth_date", "");
    formData.set("preferred_foot", "invalid-value");

    const result = parsePlayerFormData(formData);

    expect(result.preferred_foot).toBeNull();
    expect(result.first_name).toBeNull();
    expect(result.last_name).toBeNull();
    expect(result.birth_date).toBeNull();
    expect(result.is_guest).toBe(false);
  });
});
