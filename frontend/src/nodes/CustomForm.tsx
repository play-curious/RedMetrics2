import React from "react";
import * as Form from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

import "./CustomForm.scss";

import Button from "./Button";

export type CustomInput =
  | CustomTextInput
  | CustomSelectInput
  | CustomRadioInput
  | CustomTextAreaInput
  | CustomCheckboxInput
  | CustomCheckboxInputs;

export interface CustomTextInput {
  is: "text" | "password" | "email";
  regex?: RegExp;
  label?: string;
  autoFocus?: boolean;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  style?: React.CSSProperties;
  warns?: any;
}

export interface CustomSelectInput {
  is: "select";
  label?: string;
  required?: boolean;
  options: CustomOption[];
  style?: React.CSSProperties;
  warns?: any;
}

export interface CustomRadioInput {
  is: "radio";
  label?: string;
  required?: boolean;
  choices: CustomOption[];
  style?: React.CSSProperties;
  warns?: any;
}

export interface CustomTextAreaInput {
  is: "area";
  label?: string;
  autoFocus?: boolean;
  required?: boolean;
  code?: boolean;
  jsonValidation?: boolean;
  style?: React.CSSProperties;
  warns?: any;
}

export interface CustomCheckboxInput {
  is: "checkbox";
  label?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export interface CustomCheckboxInputs {
  is: "checkboxes";
  label?: string;
  required?: boolean;
  checks: CustomOption[];
  style?: React.CSSProperties;
  warns?: any;
}

export interface CustomOption {
  value: string;
  label: string;
}

export interface CustomFormOptions<T> {
  children?: any;
  className?: string;
  onSubmit: Form.SubmitHandler<T>;
  defaultValues?: Form.UnpackNestedValue<Form.DeepPartial<T>>;
  inputs: Record<Form.Path<T>, CustomInput | string>;
  style?: React.CSSProperties;
  submitText?: string;
  otherButtons?: any;
}

export function is<T extends { is: string }>(
  item: { is: string },
  type: T["is"]
): item is T {
  return item.is === type;
}

export default function CustomForm<T>(options: CustomFormOptions<T>) {
  // create default values

  // const defaultValues: any = {}; //
  // for (const inputName of Object.keys(options.inputs) as Form.Path<T>[]) {
  //   const input: string | CustomInput = options.inputs[inputName];
  //
  //   if (
  //     typeof input === "string" ||
  //     !("default" in input) ||
  //     input.default === undefined
  //   )
  //     continue;
  //
  //   defaultValues[inputName] = input.default;
  // }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = Form.useForm<T>({ mode: "onBlur" });

  React.useEffect(() => {
    if (options.defaultValues) {
      for (const key of Object.keys(
        options.defaultValues
      ) as (keyof typeof options.defaultValues)[]) {
        //@ts-ignore
        setValue(key, options.defaultValues[key]);
      }
    }
  }, [options, setValue]);

  const inputEntries = Object.entries(options.inputs) as [
    name: Form.Path<T>,
    input: CustomInput
  ][];

  return (
    <>
      <form
        onSubmit={handleSubmit(options.onSubmit)}
        className={options.className + " custom-form w-4/5 sm:w-1/2 md:w-1/3"}
      >
        {inputEntries.map(([name, input], key) => {
          if (typeof input === "undefined") {
            console.error("Form input is undefined for", name);
            return <div>{name + " is undefined"}</div>;
          } else if (typeof input === "string") {
            return (
              <input type="hidden" {...register(name, { value: input })} />
            );
          } else if (is<CustomRadioInput>(input, "radio")) {
            return (
              <label key={key} className="flex-col">
                <span>{input.label ?? name}</span> <br />
                {input.warns}
                {input.choices
                  .map(({ label, value }, subKey) => {
                    return (
                      <label key={"sub-" + subKey}>
                        <input
                          type="radio"
                          value={value}
                          {...register(name, { required: true })}
                        />
                        {label}
                      </label>
                    );
                  })
                  .join("<br/>")}
                <ErrorMessage key={key} errors={errors} name={name as any} />
              </label>
            );
          } else if (is<CustomSelectInput>(input, "select")) {
            return (
              <label key={key} className="flex-col">
                <span>{input.label ?? name}</span> <br />
                {input.warns}
                <select
                  {...register(name, { required: input.required })}
                  {...input}
                >
                  {input.options.map((option) => {
                    return <option value={option.value}>{option.label}</option>;
                  })}
                </select>
                <ErrorMessage key={key} errors={errors} name={name as any} />
              </label>
            );
          } else if (is<CustomCheckboxInputs>(input, "checkboxes")) {
            return (
              <label key={key} className="flex-col">
                <span>{input.label ?? name}</span> <br />
                {input.warns}
                {input.checks.map(({ value, label }, subKey) => {
                  return (
                    <label
                      key={"sub-2-" + subKey}
                      className="whitespace-nowrap select-none"
                    >
                      <input
                        type="checkbox"
                        value={value}
                        {...input}
                        {...register(`${name}.${subKey}` as typeof name, {
                          required: input.required,
                        })}
                      />
                      {label}
                    </label>
                  );
                })}
                <ErrorMessage key={key} errors={errors} name={name as any} />
              </label>
            );
          } else if (is<CustomCheckboxInput>(input, "checkbox")) {
            return (
              <>
                <label
                  key={key}
                  className="flex items-center cursor-pointer select-none flex-row whitespace-no-wrap"
                >
                  <input
                    type="checkbox"
                    {...register(name, { required: input.required ?? false })}
                    {...input}
                  />
                  <span className="reverse-animation">
                    {input.label ?? name}
                  </span>
                  <ErrorMessage key={key} errors={errors} name={name as any} />
                </label>
              </>
            );
          } else if (is<CustomTextAreaInput>(input, "area")) {
            const registered = register(name, {
              required: input.required ?? false,
              validate: input.jsonValidation
                ? (value) => {
                    const stringValue = String(value);
                    try {
                      JSON.parse(stringValue);
                      //const custom_data = JSON.parse(stringValue);
                      // value = JSON.stringify(
                      //   custom_data,
                      //   null,
                      //   2
                      // );
                      return true;
                    } catch (error) {
                      return String(error);
                    }
                  }
                : undefined,
            });

            let output = (
              <textarea
                {...registered}
                {...input}
                defaultValue={input.jsonValidation ? "{}" : ""}
              />
            );

            if (input.code) output = <code>{output}</code>;

            return (
              <label key={key} className="flex-col">
                <span>{input.label ?? name}</span> <br />
                {input.warns}
                {output}
                <ErrorMessage key={key} errors={errors} name={name as any} />
              </label>
            );
          } else {
            return (
              <label key={key} className="flex-col">
                <span>{input.label ?? name}</span> <br />
                {input.warns}
                <input
                  type={input.is}
                  {...register(name, {
                    required: input.required ?? false,
                    minLength: input.minLength,
                    maxLength: input.maxLength,
                    pattern: input.regex,
                  })}
                  {...input}
                />
                <ErrorMessage key={key} errors={errors} name={name as any} />
              </label>
            );
          }
        })}
        {options.children}
        <div className="button-group">
          {options.otherButtons}
          <Button submit>{options.submitText ?? "Save"}</Button>
        </div>
      </form>
    </>
  );
}
