import { turnKebabToCamelCasing } from './turn-kebab-to-camel-casing'

describe('turnKebabToCamelCasing', () => {
    it('should turn camel case to kebab', () => {
        expect(turnKebabToCamelCasing('s')).toEqual('s')
        expect(turnKebabToCamelCasing('some')).toEqual('some')
        expect(turnKebabToCamelCasing('some-name')).toEqual('someName')
        expect(turnKebabToCamelCasing('some-name-test')).toEqual('someNameTest')
        expect(turnKebabToCamelCasing('some12-name-test')).toEqual(
            'some12NameTest'
        )
    })

    it('should turn pascal case to kebab', () => {
        expect(turnKebabToCamelCasing('some')).toEqual('some')
        expect(turnKebabToCamelCasing('some')).toEqual('some')
        expect(turnKebabToCamelCasing('some-name')).toEqual('someName')
        expect(turnKebabToCamelCasing('some-name-test')).toEqual('someNameTest')
        expect(turnKebabToCamelCasing('some-name-test-d-s-t')).toEqual(
            'someNameTestDST'
        )
        expect(turnKebabToCamelCasing('d-s-t-tag')).toEqual('DSTTag')
        expect(turnKebabToCamelCasing('dst-tag')).toEqual('dstTag')
    })
})
